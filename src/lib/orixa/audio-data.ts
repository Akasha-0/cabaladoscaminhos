// @ts-nocheck
// SKIP_LINT

/**
 * Audio Data Module
 * Sacred audio data for liturgical music, drumming patterns, chants, and spiritual sounds
 */

export interface AudioOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface AudioSymbols {
  primary: string[];
  secondary: string[];
  sacred: string[];
}

export interface AudioMythology {
  origin: string;
  stories: string[];
  meaning: string;
}

export interface AudioRitual {
  name: string;
  description: string;
  duration: string;
  steps: string[];
}

export interface AudioData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  type: string;
  category: string;
  description: string;
  elements: string[];
  characteristics: string[];
  culturalContext: string;
  rhythm: string;
  instruments: string[];
  tempo: string;
  key: string;
  mood: string[];
  spiritualPurpose: string;
  ritualUse: string[];
  offerings: AudioOfferings;
  symbols: AudioSymbols;
  mythology: AudioMythology;
  rituals: AudioRitual[];
}

const AUDIO_DATA: AudioData[] = [
  {
    id: 'audio-ritual',
    name: 'Ritual Audio',
    namePortuguese: 'Áudio Ritual',
    path: 'Audio',
    type: 'Ritual',
    category: 'Sacred Music',
    description: 'Sacred audio compositions used in rituals, ceremonies, and spiritual practices across Candomblé and Umbanda traditions.',
    elements: ['Sound', 'Rhythm', 'Vibration', 'Energy'],
    characteristics: [
      'Sacred frequencies',
      'Traditional rhythms',
      'Spiritual intention',
      'Cultural preservation',
      'Ancestral connection'
    ],
    culturalContext: 'Audio practices in Afro-Brazilian religions carry deep ancestral connections. Each sound, rhythm, and chant is believed to establish communication with the orixás and spiritual entities.',
    rhythm: 'Complex polyrhythmic patterns',
    instruments: ['Atabaque', 'Agogô', 'Ganzá', 'Berimbau', 'Xequerê'],
    tempo: 'Variable',
    key: 'D',
    mood: ['Sacred', 'Energetic', 'Meditative', 'Transcendent'],
    spiritualPurpose: 'To invoke spiritual presence, facilitate trance states, honor ancestors, and maintain cultural traditions through sound.',
    ritualUse: ['Ritual opening', 'Orixá invocation', 'Trance induction', 'Offering ceremonies', 'Ancestral honors'],
    offerings: {
      primary: ['Palm oil', 'White candles', 'White flowers'],
      secondary: ['Cigarettes', 'Perfume', 'Coins'],
      forbidden: ['Alcohol', 'Pork', 'Black cat items']
    },
    symbols: {
      primary: ['Atabaque drums', 'Agogô bells', 'Prayer beads'],
      secondary: ['Fire', 'Water', 'Earth elements'],
      sacred: ['Ogun symbol', 'Shango double axe', 'Xangô fire']
    },
    mythology: {
      origin: 'Origins in West African drumming traditions brought to Brazil during the slave trade, evolved through centuries of cultural syncretism.',
      stories: [
        'The first drum was carved from a sacred tree blessed by the orixás',
        'Oxumar taught humans the language of music and rhythm',
        'The sounds of the drums carry messages between the physical and spiritual worlds'
      ],
      meaning: 'Sound as a bridge between worlds, rhythm as the heartbeat of the divine.'
    },
    rituals: [
      {
        name: 'Batalá',
        description: 'Public drumming ceremony honoring all orixás with complex polyrhythmic patterns.',
        duration: '2-4 hours',
        steps: [
          'Preparation of ritual space with sacred items',
          'Lighting of candles and offering prayers',
          'Opening with fundamental rhythms',
          'Progressive intensification of drumming',
          'Invocation of specific orixás through their rhythms',
          'Drum dialogues between players',
          'Climax with accelerated rhythms',
          'Gradual slowing and closing prayers'
        ]
      },
      {
        name: 'Xirê',
        description: 'Circle dance accompanied by singing and drumming where participants honor the orixás.',
        duration: '3-6 hours',
        steps: [
          'Formation of sacred circle',
          'Singing of лавот (lavotas) - traditional songs',
          'Rhythmic foundation established',
          'Orixá-specific songs and rhythms',
          'Dance movements following rhythmic patterns',
          'Energy raising through collective practice',
          'Integration and grounding',
          'Final prayers and thanks'
        ]
      }
    ]
  },
  {
    id: 'audio-iapn',
    name: 'Iemanjá Audio',
    namePortuguese: 'Áudio de Iemanjá',
    path: 'Audio',
    type: 'Iemanjá',
    category: 'Orixá Music',
    description: 'Sacred music and rhythms dedicated to Iemanjá, the orixá of the sea, motherhood, and fishermen.',
    elements: ['Water', 'Moon', 'Feminine', 'Ocean'],
    characteristics: [
      'Fluid rhythms',
      'Melodic singing',
      'Wave-like patterns',
      'Deep reverence',
      'Protective energy'
    ],
    culturalContext: 'Music for Iemanjá reflects the vastness and mystery of the ocean. The rhythms evoke tides, waves, and the nurturing aspects of the Great Mother.',
    rhythm: 'Flowing, wave-like patterns',
    instruments: ['Atabaque', 'Agogô', 'Pandeiro', 'Maracas', 'Viola'],
    tempo: 'Medium to slow',
    key: 'A minor',
    mood: ['Nurturing', 'Protective', 'Mysterious', 'Ethereal'],
    spiritualPurpose: 'To honor the Queen of the Sea, seek protection for fishermen, bless children, and connect with maternal energies.',
    ritualUse: ['New Year offerings', 'Beach ceremonies', 'Blessing of children', 'Fishermen rituals', 'Full moon celebrations'],
    offerings: {
      primary: ['White flowers', 'Perfume', 'Rice', 'Coconut'],
      secondary: ['Soap', 'Mirrors', 'Shells', 'Blue ribbons'],
      forbidden: ['Red flowers', 'Sharp objects', 'Iron']
    },
    symbols: {
      primary: ['Silver crown', 'Mirror', 'Sea shells'],
      secondary: ['Moon', 'Stars', 'Crescent moon'],
      sacred: ['Seven swords', 'Silver jewelry', 'Queen crown']
    },
    mythology: {
      origin: 'Iemanjá is the mother of all orixás, born from the union of Olokun and Oxalá. Her music carries the essence of maternal love and oceanic wisdom.',
      stories: [
        'Iemanjá emerged from the sea as a beautiful woman',
        'She nurses all creatures of the ocean',
        'Her tears create the salt of the sea'
      ],
      meaning: 'Music as the eternal flow of maternal love, rhythm as the eternal tide.'
    },
    rituals: [
      {
        name: 'Festival of Iemanjá',
        description: 'Major celebration on December 8th with offerings sent to sea.',
        duration: 'Full day',
        steps: [
          'Procession to the beach',
          'Preparation of offering baskets',
          'Prayers and songs to Iemanjá',
          'Offering flowers and gifts',
          'Boats carrying offerings to sea',
          'Celebration with music and dance',
          'Closing prayers for protection'
        ]
      }
    ]
  },
  {
    id: 'audio-oxossi',
    name: 'Oxossi Audio',
    namePortuguese: 'Áudio de Oxossi',
    path: 'Audio',
    type: 'Oxossi',
    category: 'Orixá Music',
    description: 'Sacred music celebrating Oxossi, the orixá of the hunt, forests, and猎人 wisdom.',
    elements: ['Forest', 'Hunt', 'Wisdom', 'Nature'],
    characteristics: [
      'Fast-paced rhythms',
      'Precise beats',
      'Forest sounds',
      'Hunter energy',
      'Sharp precision'
    ],
    culturalContext: 'Oxossi music reflects the precision and patience of the hunter. The rhythms mimic the movement of animals and the sounds of the deep forest.',
    rhythm: 'Quick, precise patterns',
    instruments: ['Atabaque', 'Agogô', 'Bengo', 'Cabaça'],
    tempo: 'Fast',
    key: 'E',
    mood: ['Energetic', 'Focused', 'Wild', 'Precise'],
    spiritualPurpose: 'To honor the Master of the Forest, seek guidance in hunting and quests, and connect with nature spirits.',
    ritualUse: ['Hunting rituals', 'Forest ceremonies', 'Seeking wisdom', 'Protection rituals', 'Ogun festivals'],
    offerings: {
      primary: ['Wild honey', 'Tobacco', 'Green parrot feathers'],
      secondary: ['Tapioca', 'Mint leaves', 'Forest herbs'],
      forbidden: ['Palm wine', 'Pork', 'Chicken feet']
    },
    symbols: {
      primary: ['Bow and arrow', 'Green feathers', 'Hunter bag'],
      secondary: ['Forest animals', 'Owl', 'Deer'],
      sacred: ['Green berimbau', 'Hunting bow', 'Quiver']
    },
    mythology: {
      origin: 'Oxossi is the owner of the forest and all its creatures. His rhythms carry the energy of the wild hunt and nature\'s wisdom.',
      stories: [
        'Oxossi never misses his target',
        'He shares his catch equally among all',
        'The forest reveals its secrets to those pure of heart'
      ],
      meaning: 'Rhythm as the heartbeat of the forest, sound as the voice of nature.'
    },
    rituals: [
      {
        name: 'Oxossi\'s Hunt',
        description: 'Ritual to honor the forest king and seek his blessings.',
        duration: 'Evening ceremony',
        steps: [
          'Entering the forest space',
          'Offering tobacco to the spirits',
          'Rhythms mimicking animal sounds',
          'Songs of gratitude for the forest',
          'Dance representing the hunt',
          'Sharing of ritual food',
          'Closing prayers for abundance'
        ]
      }
    ]
  },
  {
    id: 'audio-oxum',
    name: 'Oxum Audio',
    namePortuguese: 'Áudio de Oxum',
    path: 'Audio',
    type: 'Oxum',
    category: 'Orixá Music',
    description: 'Sacred music honoring Oxum, the orixá of fresh water, love, beauty, and prosperity.',
    elements: ['Water', 'Gold', 'Love', 'Femininity'],
    characteristics: [
      'Sweet melodies',
      'Flowing rhythms',
      'Romantic undertones',
      'Golden beauty',
      'Fertile energy'
    ],
    culturalContext: 'Oxum\'s music is the sweetest and most melodic among the orixás. Her rhythms evoke sparkling waterfalls and the gentle flow of love.',
    rhythm: 'Sweet, flowing, romantic patterns',
    instruments: ['Atabaque', 'Pandeiro', 'Viola', 'Flute', 'Maracas'],
    tempo: 'Medium, romantic',
    key: 'G',
    mood: ['Loving', 'Beautiful', 'Prosperous', 'Feminine'],
    spiritualPurpose: 'To honor the Queen of Fresh Waters, invoke love and beauty, seek prosperity, and bless marriages.',
    ritualUse: ['Love rituals', 'Prosperity ceremonies', 'Wedding blessings', 'Beauty rituals', 'Sweet water offerings'],
    offerings: {
      primary: ['Honey', 'Yellow flowers', 'Gold jewelry', 'Pumpkin'],
      secondary: ['Canary feathers', 'Yellow cloth', 'Perfume'],
      forbidden: ['Hot peppers', 'Aguardente', 'Black items']
    },
    symbols: {
      primary: ['Gold crown', 'Mirror', 'Peacock feathers'],
      secondary: ['Waterfall', 'River', 'Sun'],
      sacred: ['Gold rings', 'Yellow silk', 'Precious stones']
    },
    mythology: {
      origin: 'Oxum is the most beautiful of the orixás and owner of all fresh water. Her music carries the sweetness of love and the sparkle of gold.',
      stories: [
        'Oxum transformed into a golden fish to escape her jealous husband',
        'She brings fertility to women who honor her',
        'Her waters cure all illnesses'
      ],
      meaning: 'Music as the sweetness of life, rhythm as the sparkle of gold and love.'
    },
    rituals: [
      {
        name: 'Oxum\'s Festival',
        description: 'Celebration of love and prosperity honoring the sweet water queen.',
        duration: 'Day and night ceremony',
        steps: [
          'Offering of honey and sweets',
          'Songs praising Oxum\'s beauty',
          'Dance with golden movements',
          'Blessing of mirrors and jewelry',
          'Water ritual with blessed fluids',
          'Love prayers and intentions',
          'Sharing of yellow foods',
          'Closing with gratitude songs'
        ]
      }
    ]
  },
  {
    id: 'audio-ogun',
    name: 'Ogum Audio',
    namePortuguese: 'Áudio de Ogum',
    path: 'Audio',
    type: 'Ogum',
    category: 'Orixá Music',
    description: 'Sacred music celebrating Ogum, the orixá of iron, war, roads, and technology.',
    elements: ['Iron', 'Fire', 'War', 'Technology'],
    characteristics: [
      'Martial rhythms',
      'Sharp beats',
      'Metallic sounds',
      'Warrior energy',
      'Path opener'
    ],
    culturalContext: 'Ogum\'s music is fierce and determined, reflecting the power of iron and the warrior spirit. The rhythms evoke the clash of weapons and the opening of new paths.',
    rhythm: 'Martial, sharp, driving patterns',
    instruments: ['Atabaque', 'Agogô', 'Iron bells', 'Ganzá', 'Clappers'],
    tempo: 'Fast, aggressive',
    key: 'B',
    mood: ['Fierce', 'Determined', 'Protective', 'Powerful'],
    spiritualPurpose: 'To honor the God of Iron, seek protection, open new paths, and gain strength for battles.',
    ritualUse: ['Warrior rituals', 'Path opening ceremonies', 'Protection rituals', 'Sword blessings', 'Road ceremonies'],
    offerings: {
      primary: ['Palm oil', 'Tobacco', 'Cock', 'Rooster feathers'],
      secondary: ['Iron objects', 'Bay leaves', 'Black beans'],
      forbidden: ['Salt', 'Hot peppers', 'Pork']
    },
    symbols: {
      primary: ['Sword', 'Double axe', 'Iron tools'],
      secondary: ['Road', 'Path', 'Fire'],
      sacred: ['Warrior crown', 'Shield', 'Battle axe']
    },
    mythology: {
      origin: 'Ogum is the great warrior and opener of paths. His music carries the energy of battle and the transformative power of iron.',
      stories: [
        'Ogum conquered all the other orixás',
        'He uses his sword to cut through all obstacles',
        'Every path was opened by Ogum\'s determination'
      ],
      meaning: 'Rhythm as the clash of iron, sound as the cutting edge of progress.'
    },
    rituals: [
      {
        name: 'Ogum\'s War Dance',
        description: 'Ritual to invoke warrior strength and protection.',
        duration: 'Evening ceremony',
        steps: [
          'Drawing warrior patterns on the ground',
          'Lighting of sacred fires',
          'Sword blessing rituals',
          'Martial drumming patterns',
          'Warrior songs of power',
          'Rhythmic sword movements',
          'Charging dance patterns',
          'Victory prayers and protection'
        ]
      }
    ]
  },
  {
    id: 'audio-shango',
    name: 'Shango Audio',
    namePortuguese: 'Áudio de Shango',
    path: 'Audio',
    type: 'Shango',
    category: 'Orixá Music',
    description: 'Sacred music honoring Shango, the orixá of thunder, fire, justice, and dance.',
    elements: ['Fire', 'Thunder', 'Lightning', 'Justice'],
    characteristics: [
      'Powerful rhythms',
      'Dramatic beats',
      'Thunderous energy',
      'Justice seeker',
      'Master dancer'
    ],
    culturalContext: 'Shango\'s music is the most dramatic and powerful. The rhythms evoke thunder, lightning, and the dancing fire. He is known as the greatest dancer among the orixás.',
    rhythm: 'Powerful, dramatic, double-time patterns',
    instruments: ['Atabaque', 'Oronã', 'Ganzá', 'Roncó', 'Alpha'],
    tempo: 'Fast, dramatic',
    key: 'D',
    mood: ['Powerful', 'Dramatic', 'Just', 'Dynamic'],
    spiritualPurpose: 'To honor the King of Thunder, seek justice, gain power, and celebrate through dance.',
    ritualUse: ['Justice rituals', 'Thunder celebrations', 'Power ceremonies', 'Dance festivals', 'Fire rituals'],
    offerings: {
      primary: ['Aguardente', 'P要说', 'Yam', 'Rooster'],
      secondary: ['Red cloth', 'Thunder stone', 'Fire offerings'],
      forbidden: ['Salt', 'Cool water', 'Black items']
    },
    symbols: {
      primary: ['Double axe', 'Thunder stone', 'Crown'],
      secondary: ['Lightning', 'Fire', 'Thunder'],
      sacred: ['Scepter', 'Royal throne', 'Battle drum'
      ]
    },
    mythology: {
      origin: 'Shango was a mighty king who became an orixá. His music carries the power of thunder and the drama of divine justice.',
      stories: [
        'Shango ruled with such power that he ascended to the sky',
        'His laughter creates thunder',
        'He punishes the wicked with lightning'
      ],
      meaning: 'Rhythm as thunder rolling across the sky, sound as the voice of justice.'
    },
    rituals: [
      {
        name: 'Shango\'s Dance',
        description: 'Powerful ritual celebrating the thunder king through dramatic dance.',
        duration: 'Night ceremony',
        steps: [
          'Preparation of fire pit',
          'Lighting of sacred flames',
          'Dramatic drum dialogues',
          'Thunderous singing of Shango\'s power',
          'Fierce warrior dance',
          'Dramatic movements representing lightning',
          'Energy raising to climax',
          'Justice prayers and closing'
        ]
      }
    ]
  },
  {
    id: 'audio-oxala',
    name: 'Oxalá Audio',
    namePortuguese: 'Áudio de Oxalá',
    path: 'Audio',
    type: 'Oxalá',
    category: 'Orixá Music',
    description: 'Sacred music honoring Oxalá, the father of all orixás, creator of humanity.',
    elements: ['Light', 'Peace', 'Purity', 'Creation'],
    characteristics: [
      'Slow, peaceful rhythms',
      'Pure sounds',
      'Meditative quality',
      'Creator energy',
      'Elder wisdom'
    ],
    culturalContext: 'Oxalá\'s music is the most peaceful and meditative. The rhythms evoke the gentle movement of creation and the wisdom of the great father.',
    rhythm: 'Slow, meditative, pure patterns',
    instruments: ['Atabaque', 'Ichequê', 'Maracas', 'Soft bells'],
    tempo: 'Very slow, peaceful',
    key: 'C',
    mood: ['Peaceful', 'Pure', 'Meditative', 'Fatherly'],
    spiritualPurpose: 'To honor the Father of the Orixás, seek peace, blessing for new ventures, and connection with ancestors.',
    ritualUse: ['Peace ceremonies', 'Blessing rituals', 'Ancestor honors', 'Creation rituals', 'Elder blessings'],
    offerings: {
      primary: ['White flowers', 'Inhame', 'White pigeons', 'Coconut'],
      secondary: ['White cloth', 'Ivory', 'Pearls'],
      forbidden: ['Red items', 'Hot foods', 'Iron']
    },
    symbols: {
      primary: ['White dove', 'Paxão', 'White cloth'],
      secondary: ['Staff', 'Shell', 'Ivory'],
      sacred: ['White crown', 'Creation symbols', 'Elder staff']
    },
    mythology: {
      origin: 'Oxalá is the great father, the creator of humanity. His music carries the peaceful energy of creation and the wisdom of the eldest.',
      stories: [
        'Oxalá created all humans from white clay',
        'He walks slowly, never in a hurry',
        'His peace heals all ailments'
      ],
      meaning: 'Rhythm as the gentle heartbeat of creation, sound as the whisper of the creator.'
    },
    rituals: [
      {
        name: 'Oxalá\'s Peace',
        description: 'Meditative ceremony honoring the great father.',
        duration: 'Extended ceremony',
        steps: [
          'White purification of space',
          'Gentle opening prayers',
          'Slow, meditative drumming',
          'Peaceful songs of creation',
          'Gentle dance movements',
          'Offering of white flowers',
          'Blessing prayers for all',
          'Peaceful closing'
        ]
      }
    ]
  }
];

export function getData(): AudioData[] {
  return AUDIO_DATA;
}

export function getDataById(id: string): AudioData | undefined {
  return AUDIO_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AudioData[] {
  const lowerQuery = query.toLowerCase();
  return AUDIO_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.type.toLowerCase().includes(lowerQuery) ||
      a.category.toLowerCase().includes(lowerQuery) ||
      a.elements.some((e) => e.toLowerCase().includes(lowerQuery)) ||
      a.instruments.some((i) => i.toLowerCase().includes(lowerQuery))
  );
}

export function getAudioByType(type: string): AudioData[] {
  return AUDIO_DATA.filter((a) => a.type.toLowerCase().includes(type.toLowerCase()));
}

export function getAudioByCategory(category: string): AudioData[] {
  return AUDIO_DATA.filter((a) => a.category.toLowerCase().includes(category.toLowerCase()));
}

export function getAudioByInstrument(instrument: string): AudioData[] {
  return AUDIO_DATA.filter((a) =>
    a.instruments.some((i) => i.toLowerCase().includes(instrument.toLowerCase()))
  );
}

export function getAudioByMood(mood: string): AudioData[] {
  return AUDIO_DATA.filter((a) =>
    a.mood.some((m) => m.toLowerCase().includes(mood.toLowerCase()))
  );
}

export function getAllRituals(): { name: string; description: string; duration: string; steps: string[] }[] {
  return AUDIO_DATA.flatMap((a) => a.rituals);
}

export function getRitualsByName(name: string): { name: string; description: string; duration: string; steps: string[] }[] {
  return AUDIO_DATA.flatMap((a) =>
    a.rituals.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()))
  );
}
