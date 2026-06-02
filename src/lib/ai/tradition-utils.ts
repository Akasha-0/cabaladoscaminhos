import type { UserSpiritualData } from './types';

// ============================================================
// INTERNAL TYPES
// ============================================================

export interface TraditionInfo {
  name: string;
  origin: string;
  keywords: string[];
}

export interface SpiritualDataEntry {
  origin: string;
  keywords: string[];
}

// ============================================================
// MAJOR TRADITIONS CONFIGURATION
// ============================================================

const MAJOR_TRADITIONS = [
  'Tradição Hindu',
  'Tradição Ocidental',
  'Tradição Cabalística',
  'Tradição Pitagórica',
  'Tradição Iorubá',
  'Tradição Native Americana',
  'Tradição Celta',
  'Tradição Astral',
] as const;

/**
 * Check if a tradition origin is considered a major tradition
 */
export function isMajorTradition(origin: string): boolean {
  return MAJOR_TRADITIONS.includes(origin as typeof MAJOR_TRADITIONS[number]);
}

// ============================================================
// GROUP ENTRIES BY ORIGIN
// ============================================================

/**
 * Groups spiritual data entries by their origin
 */
export function groupEntriesByOrigin<T extends SpiritualDataEntry>(
  entries: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const entry of entries) {
    const origin = entry.origin;
    if (!grouped.has(origin)) {
      grouped.set(origin, []);
    }
    grouped.get(origin)!.push(entry);
  }
  return grouped;
}

// ============================================================
// INDIVIDUAL TRADITION EXTRACTORS
// ============================================================

type TraditionExtractor = (
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
) => TraditionInfo | null;

/**
 * Extract Yoruba/Ifá tradition from user's odu
 */
function extractYorubaTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.odu) return null;
  const entries = entriesByOrigin.get('Tradição Iorubá');
  if (!entries) return null;

  return {
    name: 'Tradição Iorubá',
    origin: 'Tradição Iorubá',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Hindu/Yoga tradition from user's orixa or chakra
 */
function extractHinduTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.orixaRegente) return null;
  const entries = entriesByOrigin.get('Tradição Hindu');
  if (!entries) return null;

  return {
    name: 'Tradição Hindu',
    origin: 'Tradição Hindu',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Western/Tarot tradition from user's major arcana
 */
function extractWesternTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.arcoMaior || userData.arcoMaior.length === 0) return null;
  const entries = entriesByOrigin.get('Tradição Ocidental');
  if (!entries) return null;

  return {
    name: 'Tradição Ocidental',
    origin: 'Tradição Ocidental',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Celtic tradition - always included for elemental balance
 */
function extractCelticTradition(
  _userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  const entries = entriesByOrigin.get('Tradição Celta');
  if (!entries) return null;

  return {
    name: 'Tradição Celta',
    origin: 'Tradição Celta',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Kabbalistic tradition from user's dominant sephirot
 */
function extractKabbalahTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.sefirotDominante || userData.sefirotDominante.length === 0) return null;
  const entries = entriesByOrigin.get('Tradição Cabalística');
  if (!entries) return null;

  return {
    name: 'Tradição Cabalística',
    origin: 'Tradição Cabalística',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Pythagorean/Numerology tradition from user's personal number
 */
function extractPythagoreanTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.numeroPessoal) return null;
  const entries = entriesByOrigin.get('Tradição Pitagórica');
  if (!entries) return null;

  return {
    name: 'Tradição Pitagórica',
    origin: 'Tradição Pitagórica',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Native American tradition - always included for holistic balance
 */
function extractNativeTradition(
  _userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  const entries = entriesByOrigin.get('Tradição Native Americana');
  if (!entries) return null;

  return {
    name: 'Tradição Native Americana',
    origin: 'Tradição Native Americana',
    keywords: entries.flatMap(t => t.keywords),
  };
}

/**
 * Extract Astral/Vedic tradition from user's rashi (zodiac sign)
 */
function extractAstralTradition(
  userData: UserSpiritualData,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): TraditionInfo | null {
  if (!userData.rashi) return null;
  const entries = entriesByOrigin.get('Tradição Astral');
  if (!entries) return null;

  return {
    name: 'Tradição Astral',
    origin: 'Tradição Astral',
    keywords: entries.flatMap(t => t.keywords),
  };
}

// ============================================================
// ALL EXTRACTORS LIST
// ============================================================

const TRADITION_EXTRACTORS: TraditionExtractor[] = [
  extractYorubaTradition,
  extractHinduTradition,
  extractWesternTradition,
  extractCelticTradition,
  extractKabbalahTradition,
  extractPythagoreanTradition,
  extractNativeTradition,
  extractAstralTradition,
];

// ============================================================
// FALLBACK HANDLER
// ============================================================

/**
 * Add major traditions as fallback when user has minimal data
 */
function addMajorTraditionsFallback(
  traditions: Set<TraditionInfo>,
  entriesByOrigin: Map<string, SpiritualDataEntry[]>
): void {
  if (traditions.size >= 3) return;

  for (const [origin, entries] of entriesByOrigin) {
    if (isMajorTradition(origin)) {
      traditions.add({
        name: origin,
        origin,
        keywords: entries.flatMap(t => t.keywords),
      });
    }
  }
}

// ============================================================
// MAIN EXTRACTED FUNCTION
// ============================================================

/**
 * Get traditions relevant to the user based on their spiritual data.
 * Extracted from TraditionMapper for better maintainability.
 */
export function getUserTraditions(
  userData: UserSpiritualData,
  spiritualData: SpiritualDataEntry[]
): TraditionInfo[] {
  const traditions = new Set<TraditionInfo>();

  // Group all spiritual data entries by origin
  const entriesByOrigin = groupEntriesByOrigin(spiritualData);

  // Apply each extractor and add non-null results
  for (const extractor of TRADITION_EXTRACTORS) {
    const tradition = extractor(userData, entriesByOrigin);
    if (tradition) {
      traditions.add(tradition);
    }
  }

  // Fallback: add all major traditions if user has minimal data
  addMajorTraditionsFallback(traditions, entriesByOrigin);

  return Array.from(traditions);
}
