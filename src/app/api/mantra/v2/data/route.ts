// ============================================================
// MANTRA DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for mantra data v2
// - Retrieve all mantra information with enhanced properties
// - Mantra categories, syllables, and practice guidance
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed mantra data for spiritual practice
const MANTRA_DATA = [
  {
    id: 'om',
    name: 'Om',
    namePt: 'Om',
    sanskrit: 'ॐ',
    origin: 'Vedic',
    pronunciation: 'AUM',
    meaning: 'Universal consciousness / Brahman',
    translation: 'The primordial sound of creation',
    syllables: ['A', 'U', 'M'],
    element: 'Ether',
    frequency: '432 Hz',
    vibration: 7,
    qualities: ['Pure consciousness', 'Transcendence', 'Oneness'],
    benefits: ['Deep meditation', 'Energy alignment', 'Spiritual awakening'],
    practice: ['Chant during meditation', 'Focus on the resonance', 'Allow sound to expand'],
    categories: ['universal', 'meditation'],
    score: 9,
  },
  {
    id: 'om-mani-padme-hum',
    name: 'Om Mani Padme Hum',
    namePt: 'Om Mani Padme Hum',
    sanskrit: 'ॐ मणि पद्मे हूँ',
    origin: 'Buddhist',
    pronunciation: 'Ohm mah-nee pahd-may hoom',
    meaning: 'Jewel in the lotus',
    translation: 'The compassion of all Buddhas',
    syllables: ['Om', 'Ma', 'Ni', 'Pad', 'Me', 'Hum'],
    element: 'Water',
    frequency: '528 Hz',
    vibration: 8,
    qualities: ['Compassion', 'Wisdom', 'Purification'],
    benefits: ['Heart opening', 'Negative energy clearing', 'Enlightenment catalyst'],
    practice: ['Recite 108 times daily', 'Visualize lotus', 'Invoke bodhisattva energy'],
    categories: ['compassion', 'protection', 'wisdom'],
    score: 9,
  },
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    namePt: 'Mantra Gayatri',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    origin: 'Vedic',
    pronunciation: 'Om bhur bhuvah svah tat savitur varenyam bhargo devasya dhimahi dhiyo yo nah prachodayat',
    meaning: 'Divine light guiding our intellect',
    translation: 'We meditate on the glory of the light divine',
    syllables: ['Om', 'Bhur', 'Bhuvah', 'Svah', 'Tat', 'Savitur', 'Varenyam', 'Bhargo', 'Devasya', 'Dhimahi', 'Dhiyo', 'Yo', 'Nah', 'Prachodayat'],
    element: 'Light',
    frequency: '528 Hz',
    vibration: 9,
    qualities: ['Divine light', 'Illumination', 'Wisdom'],
    benefits: ['Intellectual clarity', 'Spiritual protection', 'Divine connection'],
    practice: ['Chant at dawn', 'Face the sun', 'Focus on inner light'],
    categories: ['wisdom', 'light', 'dawn'],
    score: 10,
  },
  {
    id: 'mahamrityunjaya',
    name: 'Mahamrityunjaya',
    namePt: 'Mahamrityunjaya',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्',
    origin: 'Vedic',
    pronunciation: 'Om tryambakam yajamahe sugandhim pushtivardhanam urvarukamiva bandhanan mrityor mukshiya ma amritat',
    meaning: 'Great healer mantra / Immortality seeker',
    translation: 'We worship the three-eyed one who nourishes all',
    syllables: ['Om', 'Try', 'Am', 'Bakam', 'Ya', 'Ja', 'Ma', 'He', 'Su', 'Gan', 'Dhim', 'Push', 'Ti', 'Var', 'Dha', 'Nam'],
    element: 'Fire',
    frequency: '417 Hz',
    vibration: 8,
    qualities: ['Healing', 'Protection', 'Immortality'],
    benefits: ['Health restoration', 'Shields from death', 'Frees from fear'],
    practice: ['Chant 108 times', 'Visualize trident', 'Invoke Rudra energy'],
    categories: ['healing', 'protection', 'life'],
    score: 10,
  },
  {
    id: 'lokah-samastah',
    name: 'Lokah Samastah',
    namePt: 'Lokah Samastah',
    sanskrit: 'लोकः समस्ताः सुखिनो भवन्तु',
    origin: 'Vedic',
    pronunciation: 'Loh-kah sah-mah-stah suh-kee-noh buh-vun-tu',
    meaning: 'Peace for all beings',
    translation: 'May all beings in all worlds be happy',
    syllables: ['Lokah', 'Samastah', 'Sukhino', 'Bhavantu'],
    element: 'Earth',
    frequency: '432 Hz',
    vibration: 6,
    qualities: ['Peace', 'Compassion', 'Unity'],
    benefits: ['Global harmony', 'Dissolves boundaries', 'Universal love'],
    practice: ['Chant before sleep', 'Send loving-kindness', 'Visualize world peace'],
    categories: ['peace', 'compassion', 'global'],
    score: 8,
  },
  {
    id: 'so-ham',
    name: 'So Hum',
    namePt: 'So Ham',
    sanskrit: 'सोऽहम्',
    origin: 'Vedic',
    pronunciation: 'So-hum',
    meaning: 'I am that / Cosmic breath',
    translation: 'I am the infinite consciousness',
    syllables: ['So', 'Ham'],
    element: 'Air',
    frequency: '396 Hz',
    vibration: 6,
    qualities: ['Breath awareness', 'Self-realization', 'Inner peace'],
    benefits: ['Breath control', 'Meditation support', 'Ego dissolution'],
    practice: ['Sync with breath', 'Inhale So', 'Exhale Ham', 'Observe the gap'],
    categories: ['meditation', 'breath', 'self-realization'],
    score: 8,
  },
  {
    id: 'om-namah-shivaya',
    name: 'Om Namah Shivaya',
    namePt: 'Om Namah Shivaya',
    sanskrit: 'ॐ नमः शिवाय',
    origin: 'Shaiva',
    pronunciation: 'Om nah-mah shee-vah-yah',
    meaning: 'Salutation to Shiva / True self',
    translation: 'I bow to the auspicious one within',
    syllables: ['Om', 'Na', 'Ma', 'Shi', 'Va', 'Ya'],
    element: 'Fire',
    frequency: '432 Hz',
    vibration: 7,
    qualities: ['Devotion', 'Purification', 'Transformation'],
    benefits: ['Shiva connection', 'Karmic cleansing', 'Inner awakening'],
    practice: ['Chant during meditation', 'Visualize Shiva', 'Feel divine presence'],
    categories: ['devotion', 'shiva', 'transformation'],
    score: 9,
  },
  {
    id: 'nam-myoho-renge-kyo',
    name: 'Nam Myoho Renge Kyo',
    namePt: 'Nam Myoho Renge Kyo',
    sanskrit: '南無妙法蓮華経',
    origin: 'Buddhist',
    pronunciation: 'Nah-muh myo-ho ren-ge kyo',
    meaning: 'Devotion to the mystic law of the lotus',
    translation: 'I devote myself to the lotus sutra',
    syllables: ['Nam', 'Myoho', 'Renge', 'Kyo'],
    element: 'Light',
    frequency: '528 Hz',
    vibration: 8,
    qualities: ['Law of cause and effect', 'Faith', 'Law of attraction'],
    benefits: ['Manifestation power', 'Life condition improvement', 'Buddha nature awakening'],
    practice: ['Chant with conviction', 'Write on paper', 'Trust the process'],
    categories: ['manifestation', 'law', 'faith'],
    score: 9,
  },
  {
    id: 'hare-krishna',
    name: 'Hare Krishna',
    namePt: 'Hare Krishna',
    sanskrit: 'हरे कृष्ण',
    origin: 'Vaishnava',
    pronunciation: 'Huh-ray krish-nuh',
    meaning: 'Calling the divine / Seeking the highest truth',
    translation: 'O energy of the Lord, O Lord Krishna',
    syllables: ['Ha', 'Re', 'Krish', 'Na'],
    element: 'Water',
    frequency: '432 Hz',
    vibration: 7,
    qualities: ['Devotion', 'Joy', 'Transcendental'],
    benefits: ['Hare Krishna movement power', 'Divine love', 'Material bondage release'],
    practice: ['Chant with japa beads', 'Dance while chanting', 'Remember Krishna'],
    categories: ['devotion', 'krishna', 'joy'],
    score: 8,
  },
  {
    id: 'om-shanti',
    name: 'Om Shanti',
    namePt: 'Om Shanti',
    sanskrit: 'ॐ शान्तिः शान्तिः शान्तिः',
    origin: 'Vedic',
    pronunciation: 'Om shan-tee',
    meaning: 'Peace peace peace',
    translation: 'May there be peace in all directions',
    syllables: ['Om', 'Shan', 'Ti'],
    element: 'Ether',
    frequency: '417 Hz',
    vibration: 5,
    qualities: ['Peace', 'Calm', 'Harmony'],
    benefits: ['Stress relief', 'Conflict resolution', 'Inner tranquility'],
    practice: ['Chant at end of meditation', 'Visualize peace spreading', 'Offer to all beings'],
    categories: ['peace', 'calm', 'harmony'],
    score: 7,
  },
];

// Pre-computed mantra categories
const MANTRA_CATEGORIES = [
  {
    id: 'universal',
    name: 'Universal',
    namePt: 'Universal',
    description: 'Om and universal consciousness mantras',
    weight: 3,
    element: 'Ether',
    count: 3,
  },
  {
    id: 'compassion',
    name: 'Compassion',
    namePt: 'Compaixão',
    description: 'Heart-centered love and compassion mantras',
    weight: 3,
    element: 'Water',
    count: 2,
  },
  {
    id: 'healing',
    name: 'Healing',
    namePt: 'Cura',
    description: 'Health, vitality, and recovery mantras',
    weight: 3,
    element: 'Fire',
    count: 2,
  },
  {
    id: 'protection',
    name: 'Protection',
    namePt: 'Proteção',
    description: 'Shielding and spiritual protection mantras',
    weight: 2,
    element: 'Light',
    count: 2,
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    namePt: 'Sabedoria',
    description: 'Knowledge, insight, and awakening mantras',
    weight: 2,
    element: 'Light',
    count: 2,
  },
  {
    id: 'peace',
    name: 'Peace',
    namePt: 'Paz',
    description: 'Calm, tranquility, and inner peace mantras',
    weight: 2,
    element: 'Ether',
    count: 3,
  },
  {
    id: 'manifestation',
    name: 'Manifestation',
    namePt: 'Manifestação',
    description: 'Abundance, intention, and creation mantras',
    weight: 2,
    element: 'Earth',
    count: 1,
  },
  {
    id: 'devotion',
    name: 'Devotion',
    namePt: 'Devoção',
    description: 'Divine love and surrender mantras',
    weight: 2,
    element: 'Fire',
    count: 3,
  },
  {
    id: 'meditation',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Focus and awareness mantras',
    weight: 2,
    element: 'Air',
    count: 2,
  },
];

// Pre-computed syllable data
const SYLLABLE_DATA = [
  { syllable: 'Om', occurrences: 10, power: 'Source vibration', element: 'Ether' },
  { syllable: 'Hum', occurrences: 3, power: 'Mind seal', element: 'Fire' },
  { syllable: 'Shanti', occurrences: 4, power: 'Peace', element: 'Ether' },
  { syllable: 'Nam', occurrences: 5, power: 'Devotion', element: 'Water' },
];

// GET /api/mantra/v2/data - Get all mantra data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single mantra by ID
    if (id) {
      const record = MANTRA_DATA.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Mantra not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return mantra categories
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: MANTRA_CATEGORIES });
    }

    // Return syllable data
    if (type === 'syllables') {
      return NextResponse.json({ success: true, data: SYLLABLE_DATA });
    }

    // Return mantra records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: MANTRA_DATA });
    }

    // Default — return all mantra data
    return NextResponse.json({
      success: true,
      data: {
        records: MANTRA_DATA,
        categories: MANTRA_CATEGORIES,
        syllables: SYLLABLE_DATA,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mantra data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}