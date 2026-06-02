// fallow-ignore-file unused-file
// Tree of Life - Cabalistic sephiroth structure

export interface Sephirah {
  name: string;
  enName: string;
  number: number;
  path: number;
  hebrew: string;
  meaning: string;
  element: string;
  planet: string;
  letter: string;
}

export interface Path {
  from: number;
  to: number;
  number: number;
  hebrew: string;
  tarot?: string;
}

const SEPHIROTH: Sephirah[] = [
  { number: 1, name: 'Keter', enName: 'Crown', path: 11, hebrew: 'כתר', meaning: 'Crown', element: 'Spirit', planet: 'Beyond', letter: 'א', },
  { number: 2, name: 'Chokhmah', enName: 'Wisdom', path: 12, hebrew: 'חכמה', meaning: 'Wisdom', element: 'Air', planet: 'Zodiac', letter: 'ב', },
  { number: 3, name: 'Binah', enName: 'Understanding', path: 13, hebrew: 'בינה', meaning: 'Understanding', element: 'Water', planet: 'Saturn', letter: 'ג', },
  { number: 4, name: 'Chesed', enName: 'Mercy', path: 7, hebrew: 'חסד', meaning: 'Mercy', element: 'Water', planet: 'Jupiter', letter: 'ד', },
  { number: 5, name: 'Gevurah', enName: 'Severity', path: 8, hebrew: 'גבורה', meaning: 'Severity', element: 'Fire', planet: 'Mars', letter: 'ה', },
  { number: 6, name: 'Tiferet', enName: 'Beauty', path: 9, hebrew: 'תפארת', meaning: 'Beauty', element: 'Fire', planet: 'Sun', letter: 'ו', },
  { number: 7, name: 'Netzach', enName: 'Victory', path: 10, hebrew: 'נצח', meaning: 'Victory', element: 'Fire', planet: 'Venus', letter: 'ז', },
  { number: 8, name: 'Hod', enName: 'Glory', path: 31, hebrew: 'הוד', meaning: 'Glory', element: 'Earth', planet: 'Mercury', letter: 'ח', },
  { number: 9, name: 'Yesod', enName: 'Foundation', path: 32, hebrew: 'יסוד', meaning: 'Foundation', element: 'Earth', planet: 'Moon', letter: 'ט', },
  { number: 10, name: 'Malkuth', enName: 'Kingdom', path: 21, hebrew: 'מלכות', meaning: 'Kingdom', element: 'Earth', planet: 'Earth', letter: 'י', },
];

// 22 paths of the Sepher Yetzirah connecting the sephiroth
const PATHS: Path[] = [
  { from: 1, to: 2, number: 11, hebrew: 'אלף' },
  { from: 1, to: 3, number: 12, hebrew: 'בית' },
  { from: 2, to: 4, number: 14, hebrew: 'גימל' },
  { from: 2, to: 5, number: 13, hebrew: 'דלת' },
  { from: 3, to: 6, number: 15, hebrew: 'הא' },
  { from: 3, to: 7, number: 16, hebrew: 'וו' },
  { from: 4, to: 5, number: 17, hebrew: 'זין' },
  { from: 4, to: 6, number: 7, hebrew: 'חית' },
  { from: 5, to: 6, number: 18, hebrew: 'טית' },
  { from: 6, to: 7, number: 19, hebrew: 'יוד' },
  { from: 6, to: 8, number: 20, hebrew: 'כף' },
  { from: 6, to: 9, number: 9, hebrew: 'למד' },
  { from: 7, to: 8, number: 21, hebrew: 'מם' },
  { from: 7, to: 10, number: 10, hebrew: 'נון' },
  { from: 8, to: 9, number: 22, hebrew: 'סמך' },
  { from: 8, to: 10, number: 23, hebrew: 'עין' },
  { from: 9, to: 10, number: 24, hebrew: 'פא' },
  { from: 1, to: 6, number: 27, hebrew: 'שין' },
  { from: 2, to: 6, number: 26, hebrew: 'ריש' },
  { from: 3, to: 6, number: 25, hebrew: 'קוף' },
  { from: 4, to: 9, number: 28, hebrew: 'צדי' },
  { from: 5, to: 10, number: 29, hebrew: 'תאו' },
  { from: 7, to: 9, number: 30, hebrew: 'תו' },
];

export interface TreeOfLife {
  sephiroth: Sephirah[];
  paths: Path[];
  getSephirah: (number: number) => Sephirah | undefined;
  getPath: (from: number, to: number) => Path | undefined;
  getSephirahByName: (name: string) => Sephirah | undefined;
}

export function getTree(): TreeOfLife {
  return {
    sephiroth: SEPHIROTH,
    paths: PATHS,
    getSephirah(number: number) {
      return SEPHIROTH.find(s => s.number === number);
    },
    getPath(from: number, to: number) {
      return PATHS.find(p => (p.from === from && p.to === to) || (p.from === to && p.to === from));
    },
    getSephirahByName(name: string) {
      return SEPHIROTH.find(s => s.name.toLowerCase() === name.toLowerCase());
    },
  };
}