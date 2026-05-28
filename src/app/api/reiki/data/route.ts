// ============================================================
// REIKI DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for reiki data
// - Retrieve all reiki information
// - Reiki healing and energy data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed reiki data for spiritual practice
const REIKI_DATA = [
  {
    id: 'usui',
    name: 'Usui Reiki',
    namePt: 'Reiki Usui',
    origin: 'Japan',
    founder: 'Mikao Usui',
    year: 1922,
    meaning: 'Universal life energy',
    description: 'The original Reiki system developed by Mikao Usui, combining spiritual practice with natural healing energy.',
    levels: [
      {
        level: 1,
        name: 'Shoden',
        namePt: 'Primeiro Nível',
        description: 'Basic training - self-healing and attunement to Reiki energy',
        symbols: [],
        practices: ['Self-healing', 'Hand positions', 'Energy channeling'],
      },
      {
        level: 2,
        name: 'Okuden',
        namePt: 'Segundo Nível',
        description: 'Intermediate training - distance healing and symbol introduction',
        symbols: ['Cho Ku Rei', 'Sei He Ki', 'Hon Sha Ze Sho Nen'],
        practices: ['Distance healing', 'Mental/emotional healing', 'Symbol activation'],
      },
      {
        level: 3,
        name: 'Shinpiden',
        namePt: 'Terceiro Nível',
        description: 'Master/Teacher training - spiritual development and teaching',
        symbols: ['Dai Ko Myo'],
        practices: ['Master symbols', 'Teaching attunements', 'Spiritual growth'],
      },
    ],
    principles: [
      'Just for today, do not anger',
      'Just for today, do not worry',
      'Honor your parents, teachers, and elders',
      'Earn your living honestly',
      'Show gratitude to all things',
    ],
    handPositions: [
      { area: 'Head', positions: ['Crown', 'Third eye', 'Temples', 'Ears', 'Cheeks'] },
      { area: 'Front body', positions: ['Throat', 'Heart', 'Solar plexus', 'Abdomen', 'Pelvis'] },
      { area: 'Back body', positions: ['Shoulders', 'Upper back', 'Lower back', 'Sacrum'] },
      { area: ' extremities', positions: ['Hands', 'Feet', 'Knees', 'Elbows'] },
    ],
    benefits: [
      'Stress reduction and relaxation',
      'Pain management',
      'Emotional healing',
      'Spiritual growth',
      'Energy balancing',
      'Chakra alignment',
    ],
    associatedSefirot: ['Chesed', 'Gevurah', 'Tiferet'],
    associatedChakras: ['Heart', 'Crown'],
    score: 8,
  },
  {
    id: 'karuna',
    name: 'Karuna Reiki',
    namePt: 'Reiki Karuna',
    origin: 'United States',
    founder: 'William Lee Rand',
    year: 1990,
    meaning: 'Compassionate action',
    description: 'An advanced Reiki system developed by William Lee Rand, focusing on compassion and deeper healing work.',
    levels: [
      {
        level: 1,
        name: 'Level 1',
        namePt: 'Nível 1',
        description: 'Introduction to Karuna symbols and compassionate healing',
        symbols: ['Raku', 'Zonar', 'Halu'],
        practices: ['Symbol activation', 'Compassionate healing', 'Energy clearing'],
      },
      {
        level: 2,
        name: 'Level 2',
        namePt: 'Nível 2',
        description: 'Advanced symbols and distance healing with compassion',
        symbols: ['Shanti', 'Rama', 'Klim', 'Sudarshan'],
        practices: ['Advanced distance healing', 'Karma clearing', 'Soul healing'],
      },
      {
        level: 3,
        name: 'Master',
        namePt: 'Mestre',
        description: 'Master symbols and ability to teach Karuna Reiki',
        symbols: ['Dab Mons', 'Fire Ball', 'Holistic'],
        practices: ['Teaching attunements', 'Advanced healing', 'Spiritual empowerment'],
      },
    ],
    principles: [
      'Karma is opportunity for growth',
      'All beings are one',
      'Compassion is the path to enlightenment',
      'Each moment is a new beginning',
      'Be the change you wish to see',
    ],
    symbols: [
      { name: 'Raku', purpose: 'Grounding and energy activation' },
      { name: 'Zonar', purpose: 'Amplification and expansion' },
      { name: 'Halu', purpose: 'Sending healing across time and space' },
      { name: 'Shanti', purpose: 'Peace and tranquility' },
      { name: 'Rama', purpose: 'Mastery and power' },
      { name: 'Klim', purpose: 'Connecting to higher self' },
      { name: 'Sudarshan', purpose: 'Karmic clearing and purification' },
    ],
    benefits: [
      'Deep compassion development',
      'Karmic healing',
      'Soul healing and integration',
      'Enhanced spiritual connection',
      'Greater healing power',
      'Accelerated personal growth',
    ],
    associatedSefirot: ['Chesed', 'Gevurah', 'Netzach'],
    associatedChakras: ['Heart', 'Third eye', 'Crown'],
    score: 9,
  },
  {
    id: 'sacred-火',
    name: 'Sacred Fire Reiki',
    namePt: 'Reiki Fogo Sagrado',
    origin: 'United States',
    founder: 'Nicholas H Parker',
    year: 2001,
    meaning: 'Divine transformative energy',
    description: 'A powerful Reiki system based on the element of fire and sacred flame symbolism.',
    levels: [
      {
        level: 1,
        name: 'Ignition',
        namePt: 'Ignição',
        description: 'Awakening the sacred fire within',
        symbols: ['Embrew', 'Gandharva'],
        practices: ['Sacred fire activation', 'Inner flame meditation', 'Heat healing'],
      },
      {
        level: 2,
        name: 'Blazing',
        namePt: 'Brasa',
        description: 'Expanding the sacred fire outward',
        symbols: ['Embrew II', 'Harth', 'Kureze'],
        practices: ['Flame healing', 'Transformation work', 'Divine protection'],
      },
      {
        level: 3,
        name: 'Cleansing',
        namePt: 'Purificação',
        description: 'Advanced fire purification techniques',
        symbols: ['Embrew III', 'Kumite', 'Zian'],
        practices: ['Advanced purification', 'Ascended healing', 'Master attunements'],
      },
    ],
    principles: [
      'Sacred fire purifies all',
      'Transformation comes through change',
      'Light dispels darkness',
      'Every soul carries the divine flame',
      'Fire is the ultimate healer',
    ],
    symbolism: {
      element: 'Fire',
      direction: 'South',
      season: 'Summer',
      time: 'Noon',
      qualities: ['Transformation', 'Purification', 'Power', 'Passion'],
    },
    benefits: [
      'Deep purification',
      'Transformation of old patterns',
      'Divine protection',
      'Inner power awakening',
      'Spiritual purification',
      'Soul ember activation',
    ],
    associatedSefirot: ['Gevurah', 'Netzach', 'Hod'],
    associatedChakras: ['Solar plexus', 'Heart', 'Sacral'],
    score: 7,
  },
  {
    id: 'lightarian',
    name: 'Lightarian Reiki',
    namePt: 'Reiki Lightariano',
    origin: 'United States',
    founder: 'Susan Pearlain',
    year: 2002,
    meaning: 'Divine light attunement',
    description: 'A system channeling cosmic light energy for spiritual development and healing.',
    levels: [
      {
        level: 1,
        name: 'Personal',
        namePt: 'Pessoal',
        description: 'Personal healing attunement through divine light',
        symbols: ['Personal Rainbow Bridge', 'Personal Power'],
        practices: ['Personal healing', 'Energy clearing', 'Light embodiment'],
      },
      {
        level: 2,
        name: 'Angular',
        namePt: 'Angular',
        description: 'Focused light energy for specific healing',
        symbols: ['Angular 1', 'Angular 2', 'Angular 3'],
        practices: ['Targeted healing', 'Light meditation', 'Energy activation'],
      },
      {
        level: 3,
        name: 'Celestial',
        namePt: 'Celestial',
        description: 'Access to angelic light dimensions',
        symbols: ['Celestial 1', 'Celestial 2', 'Celestial 3'],
        practices: ['Angelic healing', 'Cosmic light work', 'Divine connection'],
      },
      {
        level: 4,
        name: 'Buddhic',
        namePt: 'Búdico',
        description: 'Highest level of light attunement',
        symbols: ['Buddhic Beam', 'Buddhic Ray'],
        practices: ['Buddhic activation', 'Soul healing', 'Master attunement'],
      },
    ],
    principles: [
      'Divine light is available to all',
      'Light heals and transforms',
      'Each person is a divine being of light',
      'The soul chooses its healing',
      'Light is the ultimate truth',
    ],
    lightDimensions: [
      { dimension: 'Angelic', color: 'Gold and white', purpose: 'Divine protection and connection' },
      { dimension: 'Celestial', color: 'Pink and lavender', purpose: 'Love and spiritual growth' },
      { dimension: 'Buddhic', color: 'Pure white and platinum', purpose: 'Soul awakening and enlightenment' },
    ],
    benefits: [
      'Divine light channeling',
      'Soul-level healing',
      'Angelic connection',
      'Light embodiment',
      'Accelerated spiritual growth',
      'Energetic purification',
    ],
    associatedSefirot: ['Kether', 'Chokhmah', 'Binah'],
    associatedChakras: ['All', 'especially Crown and Heart'],
    score: 8,
  },
  {
    id: 'seichim',
    name: 'Seichim',
    namePt: 'Seichim',
    origin: 'Egypt',
    founder: 'Ancient Egyptian tradition',
    year: 5000,
    meaning: 'Light and love energy',
    description: 'An ancient Egyptian healing modality combining sacred light and heart-centered energy.',
    levels: [
      {
        level: 1,
        name: 'Foundation',
        namePt: 'Fundação',
        description: 'Basic attunement to Seichim energy',
        symbols: ['Sekhem', 'Activation symbol'],
        practices: ['Light healing', 'Heart-centered work', 'Energy channeling'],
      },
      {
        level: 2,
        name: 'Advanced',
        namePt: 'Avançado',
        description: 'Enhanced healing and distance work',
        symbols: ['Advanced Seichim symbols'],
        practices: ['Advanced healing', 'Distance healing', 'Soul healing'],
      },
      {
        level: 3,
        name: 'Master',
        namePt: 'Mestre',
        description: 'Master attunement and teaching ability',
        symbols: ['Master Seichim symbol'],
        practices: ['Teaching attunements', 'Advanced soul work', 'Spiritual activation'],
      },
    ],
    principles: [
      'All healing comes from divine source',
      'Light and love are the ultimate healing forces',
      'Each being carries the light within',
      'Compassion opens the door to healing',
      'Seichim heals on all levels',
    ],
    connection: {
      tradition: 'Ancient Egyptian',
      deities: ['Sekhmet', 'Ra', 'Hathor'],
      sacredSites: ['Great Pyramid', 'Karnak', 'Abu Simbel'],
    },
    benefits: [
      'Heart-centered healing',
      'Ancient wisdom connection',
      'Soul integration',
      'Light body activation',
      'Divine love channeling',
      'Egyptian mystery access',
    ],
    associatedSefirot: ['Tiferet', 'Netzach', 'Hod'],
    associatedChakras: ['Heart', 'Solar plexus', 'All'],
    score: 7,
  },
];

// GET /api/reiki/data - Get all reiki data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reikiId = searchParams.get('id');

    if (reikiId) {
      const reiki = REIKI_DATA.find((r) => r.id === reikiId);
      if (!reiki) {
        return NextResponse.json(
          { error: 'Reiki system not found', availableIds: REIKI_DATA.map((r) => r.id) },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: reiki });
    }

    return NextResponse.json({
      data: REIKI_DATA,
      meta: {
        count: REIKI_DATA.length,
        version: 'v1',
        category: 'reiki',
      },
    });
  } catch (error) {
    console.error('Reiki API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}