/**
 * Spiritual Calculations Module
 * Provides mystical/spiritual numerological and positional calculations
 * Complement to astronomical astrology calculations in lib/astrologia/
 */

export interface SpiritualInput {
  birthDate?: string;
  name?: string;
  /** Julian Day Number for astronomical calculations */
  jd?: number;
}

export interface SpiritualResult {
  sefirot: number[];
  letterValue: number;
  /** Numerological reduction (1-9 or 11, 22, 33 master numbers) */
  numerology: number;
  /** Path on the Tree of Life (0-21) */
  treeOfLifePath?: number;
  /** Element: FIRE, WATER, EARTH, AIR */
  element?: 'FIRE' | 'WATER' | 'EARTH' | 'AIR';
  /** Zodiac quality: CARDINAL, FIXED, MUTABLE */
  quality?: 'CARDINAL' | 'FIXED' | 'MUTABLE';
}

/**
 * Main spiritual calculation dispatcher
 */
export function calculate(input: SpiritualInput): SpiritualResult {
  const result: SpiritualResult = {
    sefirot: calculateSefirot(input.birthDate),
    letterValue: input.name ? calculateGematria(input.name) : 0,
    numerology: input.birthDate
      ? calculateNumerology(input.birthDate)
      : 0,
    treeOfLifePath: input.name ? calculateTreePath(input.name) : undefined,
    element: input.name ? calculateElement(input.name) : undefined,
    quality: input.birthDate ? calculateQuality(input.birthDate) : undefined,
  };
  return result;
}

/**
 * Calculate the 10 Sefirot values from birth date components
 * Maps (day, month, year) to the Tree of Life energies
 */
export function calculateSefirot(birthDate?: string): number[] {
  if (!birthDate) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const parts = birthDate.split(/[-/\.]/);
  if (parts.length < 3) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const day = parseInt(parts[0], 10) || 0;
  const month = parseInt(parts[1], 10) || 0;
  const year = parseInt(parts[2], 10) || 0;

  // Sefirot: Keter(1), Chokmah(2), Binah(3), Chesed(4), Gevurah(5),
  //         Tiferet(6), Netzach(7), Hod(8), Yesod(9), Malkuth(10)
  return [
    Math.floor((day + month) % 10) + 1,         // Keter
    Math.floor((year % 22) + 1),                // Chokmah
    Math.floor((month * 3) % 10) + 1,           // Binah
    Math.floor((day * 4) % 10) + 1,             // Chesed
    Math.floor((year % 5) + 1),                 // Gevurah
    Math.floor(((day + month + year) % 10) % 9) + 1, // Tiferet
    Math.floor((day + year) % 10) + 1,          // Netzach
    Math.floor((month + year) % 10) + 1,       // Hod
    Math.floor(((day * month) % 9) + 1),       // Yesod
    Math.floor(((day + month + year) % 12) + 1), // Malkuth
  ];
}

/**
 * Gematria: sum of Hebrew letter values assigned to Latin letters
 * A=1, B=2, ..., Z=26 (simplified ordinal gematria)
 */
export function calculateGematria(name: string): number {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  let sum = 0;
  for (const char of clean) {
    sum += char.charCodeAt(0) - 64; // A=1, B=2, ...
  }
  return sum;
}

/**
 * Pythagorean numerology: sum digits repeatedly until 1-9 or master number
 */
export function calculateNumerology(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, '');
  if (!digits) return 0;
  return reduceDigits(digits.split('').map(Number));
}

/**
 * Recursive digit reduction with master number preservation
 */
export function reduceDigits(nums: number[]): number {
  const sum = nums.reduce((acc, n) => acc + n, 0);
  if (sum <= 9) return sum;
  if (sum === 11 || sum === 22 || sum === 33) return sum;
  return reduceDigits(String(sum).split('').map(Number));
}

/**
 * Tree of Life path number from name (1-22, matching the Major Arcana)
 */
export function calculateTreePath(name: string): number {
  const value = calculateGematria(name);
  return ((value - 1) % 22) + 1;
}

/**
 * Element calculation from name checksum
 */
export function calculateElement(name: string): 'FIRE' | 'WATER' | 'EARTH' | 'AIR' {
  const value = calculateGematria(name);
  const index = value % 4;
  return (['FIRE', 'EARTH', 'AIR', 'WATER'] as const)[index];
}

/**
 * Quality (Cardinal/Fixed/Mutable) from birth month
 */
export function calculateQuality(birthDate: string): 'CARDINAL' | 'FIXED' | 'MUTABLE' {
  const parts = birthDate.split(/[-/\.]/);
  const month = parseInt(parts[1], 10) || 1;
  // Cardinals: Aries, Cancer, Libra, Capricorn (months 1,4,7,10)
  // Fixed:      Taurus, Leo, Scorpio, Aquarius (months 2,5,8,11)
  // Mutable:    Gemini, Virgo, Sagittarius, Pisces (months 3,6,9,12)
  const rem = month % 3;
  if (rem === 1) return 'CARDINAL';
  if (rem === 2) return 'FIXED';
  return 'MUTABLE';
}
