/** Hebrew path letter metadata for the 22 paths of the Tree of Life.
 * Each path connects two sefirot and carries a letter of the Hebrew alphabet,
 * a name, a meaning, and a pillar assignment. */

export type HebrewPathPillar = 'right' | 'left' | 'center';

export interface HebrewPathLetter {
  from: string;       // source sefira name
  to: string;         // target sefira name
  letter: string;      // Hebrew letter
  name: string;       // letter name
  meaning: string;    // spiritual meaning
  pillar: HebrewPathPillar;
}

/** Pillar color coding for SVG rendering */
export const HEBREW_PATH_COLORS: Record<HebrewPathPillar, string> = {
  right:  '#4FC3F7',  // cyan — Din (Judgment)
  left:   '#EF5350',  // red  — Chesed (Mercy)
  center: '#FFD700',  // gold — Tiferet (Harmony)
};

/** The 22 Hebrew letters assigned to the 22 paths of the Sefirot Tree.
 * Order matches SEFIRA_PATH_PAIRS index in mandala-layers.ts (paths 1–22).
 * Pillar assignment: right = paths from Chokhmah side;
 *                    left  = paths from Binah side;
 *                    center = paths through Tiferet or connecting extremes. */
export const HEBREW_PATH_LETTERS: HebrewPathLetter[] = [
  // Path 1: Keter → Chokhmah (Aleph א — "Ox" — Crown)
  { from: 'Keter',    to: 'Chokhmah', letter: 'א', name: 'Aleph',   meaning: 'Crown of transcendent unity',            pillar: 'center' },
  // Path 2: Keter → Binah (Beth ב — "House" — Understanding)
  { from: 'Keter',    to: 'Binah',    letter: 'ב', name: 'Beth',    meaning: 'House of divine revelation',             pillar: 'center' },
  // Path 3: Chokhmah → Chesed (Gimel ג — "Camel" — Kindness)
  { from: 'Chokhmah', to: 'Chesed',   letter: 'ג', name: 'Gimel',  meaning: 'Camel of loving-kindness journey',       pillar: 'right'  },
  // Path 4: Chokhmah → Gevurah (Daleth ד — "Door" — Judgment)
  { from: 'Chokhmah', to: 'Gevurah',  letter: 'ד', name: 'Daleth', meaning: 'Door of divine judgment',               pillar: 'right'  },
  // Path 5: Binah → Chesed (Heh ה — "Window" — Vision)
  { from: 'Binah',    to: 'Chesed',   letter: 'ה', name: 'Heh',     meaning: 'Window of contemplating eternity',      pillar: 'left'   },
  // Path 6: Binah → Gevurah (Vav ו — "Nail" — Redemption)
  { from: 'Binah',    to: 'Gevurah',  letter: 'ו', name: 'Vav',     meaning: 'Nail of divine connection',              pillar: 'left'   },
  // Path 7: Chesed → Gevurah (Zayin ז — "Sword" — Balance)
  { from: 'Chesed',   to: 'Gevurah',  letter: 'ז', name: 'Zayin',   meaning: 'Sword of mercy tempered by judgment',   pillar: 'center' },
  // Path 8: Chesed → Tiferet (Cheth ח — "Fence" — Beauty)
  { from: 'Chesed',   to: 'Tiferet',  letter: 'ח', name: 'Cheth',   meaning: 'Fence of compassion enclosing beauty',   pillar: 'right'  },
  // Path 9: Gevurah → Tiferet (Teth ט — "Serpent" — Intellect)
  { from: 'Gevurah',  to: 'Tiferet',  letter: 'ט', name: 'Teth',    meaning: 'Serpent of hidden intellect',            pillar: 'left'   },
  // Path 10: Chesed → Netzach (Yud י — "Hand" — Victory)
  { from: 'Chesed',   to: 'Netzach',  letter: 'י', name: 'Yud',     meaning: 'Hand of eternal loving-kindness',         pillar: 'right'  },
  // Path 11: Chesed → Hod (Kaf כ — "Palm" — Splendor)
  { from: 'Chesed',   to: 'Hod',      letter: 'כ', name: 'Kaf',     meaning: 'Palm of divine splendor',                 pillar: 'right'  },
  // Path 12: Gevurah → Netzach (Lamed ל — "Ox-goad" — Bonding)
  { from: 'Gevurah',  to: 'Netzach',  letter: 'ל', name: 'Lamed',   meaning: 'Ox-goad of directed willpower',          pillar: 'left'   },
  // Path 13: Gevurah → Hod (Mem מ — "Water" — Fluidity)
  { from: 'Gevurah',  to: 'Hod',      letter: 'מ', name: 'Mem',     meaning: 'Water of turbulence and stillness',       pillar: 'left'   },
  // Path 14: Tiferet → Netzach (Nun נ — "Fish" — Eternity)
  { from: 'Tiferet',  to: 'Netzach',  letter: 'נ', name: 'Nun',     meaning: 'Fish of beauty swimming in eternity',    pillar: 'center' },
  // Path 15: Tiferet → Hod (Samekh ס — "Prop" — Foundation)
  { from: 'Tiferet',  to: 'Hod',      letter: 'ס', name: 'Samekh',  meaning: 'Prop of balanced harmony',               pillar: 'center' },
  // Path 16: Tiferet → Yesod (Ayin ע — "Eye" — Detection)
  { from: 'Tiferet',  to: 'Yesod',    letter: 'ע', name: 'Ayin',     meaning: 'Eye of beauty discerning truth',         pillar: 'center' },
  // Path 17: Netzach → Yesod (Peh פ — "Mouth" — Desire)
  { from: 'Netzach',  to: 'Yesod',    letter: 'פ', name: 'Peh',     meaning: 'Mouth of victorious desire',             pillar: 'right'  },
  // Path 18: Netzach → Malkuth (Tzade צ — "Fish-hook" — Merit)
  { from: 'Netzach',  to: 'Malkuth',  letter: 'צ', name: 'Tzade',   meaning: 'Fish-hook of righteousness',            pillar: 'right'  },
  // Path 19: Hod → Yesod (Qof ק — "Monkey" — Imagination)
  { from: 'Hod',      to: 'Yesod',    letter: 'ק', name: 'Qof',     meaning: 'Monkey of mystical imagination',          pillar: 'left'   },
  // Path 20: Hod → Malkuth (Resh ר — "Head" — World)
  { from: 'Hod',      to: 'Malkuth',  letter: 'ר', name: 'Resh',    meaning: 'Head of splendorous world',               pillar: 'left'   },
  // Path 21: Yesod → Malkuth (Shin ש — "Tooth" — Elemental)
  { from: 'Yesod',    to: 'Malkuth',  letter: 'ש', name: 'Shin',    meaning: 'Three-flame fire of elemental nature',   pillar: 'center' },
  // Path 22: Tiferet → Malkuth (Tau ת — "Cross" — Matter)
  { from: 'Tiferet',  to: 'Malkuth',  letter: 'ת', name: 'Tau',     meaning: 'Cross of divine beauty manifested',       pillar: 'center' },
];
