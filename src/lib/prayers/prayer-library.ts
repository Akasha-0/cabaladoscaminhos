export interface Prayer {
  id: string;
  title: string;
  text: string;
  origin?: string;
  category?: string;
}

const prayers: Prayer[] = [
  // Cabala prayers
  {
    id: 'elohim',
    title: 'Ein Sof Prayer',
    text: 'Adonai, source of infinite light, reveal Your mysteries to those who seek with pure heart. Guide us through the paths of the Tree of Life.',
    origin: 'Kabbalistic tradition',
    category: 'cabala',
  },
  {
    id: 'sefirot-blessing',
    title: 'Sefirot Blessing',
    text: 'Keter, crown us with wisdom. Chokhmah, illuminate our path. Binah, grant us understanding. May the ten Sefirot guide our spiritual journey.',
    origin: 'Kabbalistic tradition',
    category: 'cabala',
  },
  {
    id: 'tree-of-life',
    title: 'Tree of Life Meditation',
    text: 'From Keter to Malkhut, the light descends. From Malkhut to Keter, our prayers ascend. We are the bridge between worlds.',
    origin: 'Zohar tradition',
    category: 'cabala',
  },

  // Orixás prayers
  {
    id: 'orisha-blessing',
    title: 'Blessing of the Orixás',
    text: 'Olodumare, supreme creator, grant us the wisdom of Orunmila. May the protection of Ogum strengthen our path. May the joy of Oshun fill our hearts.',
    origin: 'Yoruba tradition',
    category: 'orixas',
  },
  {
    id: 'shango-praise',
    title: 'Shango Invocation',
    text: 'King of the lightning, lord of the drums, we call upon your power. Strike away negativity and bring justice to our lives.',
    origin: 'Yoruba tradition',
    category: 'orixas',
  },
  {
    id: 'oxum Invocation',
    title: 'Oxum Sweet Waters',
    text: 'Oxum, mother of golden rivers, pour your blessings upon this sacred space. Let love and abundance flow like your sweet waters.',
    origin: 'Yoruba tradition',
    category: 'orixas',
  },

  // General spiritual prayers
  {
    id: 'gratitude',
    title: 'Morning Gratitude',
    text: 'For this new day, I am grateful. For breath, for light, for the opportunity to grow. I offer my thanks to the universe and all its wisdom.',
    origin: 'Universal',
    category: 'gratitude',
  },
  {
    id: 'protection',
    title: 'Shield of Light',
    text: 'Surround me with divine light. Let no negativity penetrate this sacred space. I am protected, I am blessed, I am whole.',
    origin: 'Universal',
    category: 'protection',
  },
  {
    id: 'guidance',
    title: 'Path of Wisdom',
    text: 'Guide my steps on this journey. Lead me away from darkness and toward the light. Grant me discernment to choose rightly.',
    origin: 'Universal',
    category: 'guidance',
  },

  // Ancestral prayers
  {
    id: 'ancestor-honor',
    title: 'Honoring the Ancestors',
    text: 'Ancestors who came before, guide my steps. Those who paved the way, light my path. I honor your sacrifice and carry your wisdom.',
    origin: 'Ancestral traditions',
    category: 'ancestral',
  },
  {
    id: 'lineage-blessing',
    title: 'Lineage Blessing',
    text: 'May the blessing of all generations flow through me. May I honor those who gave me life and inspire those who will come.',
    origin: 'Ancestral traditions',
    category: 'ancestral',
  },

  // Meditation prayers
  {
    id: 'stillness',
    title: 'Prayer for Stillness',
    text: 'In the silence between thoughts, I find peace. In the space between breaths, I find clarity. Let my mind become calm as still waters.',
    origin: 'Meditation tradition',
    category: 'meditation',
  },
  {
    id: 'breath-sacred',
    title: 'Sacred Breath',
    text: 'With each breath, I inhale peace, I exhale tension. The breath is the bridge between body and spirit. I breathe with intention.',
    origin: 'Meditation tradition',
    category: 'meditation',
  },
];

/**
 * Returns all prayers from the library.
 */
export function getPrayers(): Prayer[] {
  return prayers;
}

/**
 * Returns prayers filtered by category.
 */
export function getPrayersByCategory(category: string): Prayer[] {
  return prayers.filter((p) => p.category === category);
}

/**
 * Returns a random prayer.
 */
export function getRandomPrayer(): Prayer {
  const index = Math.floor(Math.random() * prayers.length);
  return prayers[index];
}

/**
 * Returns a random prayer from a specific category.
 */
export function getRandomPrayerByCategory(category: string): Prayer | null {
  const filtered = prayers.filter((p) => p.category === category);
  if (filtered.length === 0) return null;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}