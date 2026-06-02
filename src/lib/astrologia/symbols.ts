// fallow-ignore-file unused-file
/* eslint-disable */

/**
 * Astrological symbols library
 * Provides SVG strings for zodiac signs, planets, and aspects
 */

// Zodiac signs as SVG paths
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 80 Q30 20 50 20 Q70 20 80 50 M50 20 L40 40 M50 20 L60 40" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  taurus: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 70 Q30 30 50 30 Q70 30 70 70" stroke="currentColor" stroke-width="4" fill="none"/><path d="M40 30 L40 20 M60 30 L60 20" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  gemini: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 30 L35 70 M65 30 L65 70" stroke="currentColor" stroke-width="4" fill="none"/><path d="M20 35 L80 35 M20 65 L80 65" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  cancer: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 60 Q30 30 50 30 Q70 30 70 60 L70 65 Q70 85 50 85 Q30 85 30 65 Z" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  leo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="4" fill="none"/><path d="M75 50 L90 40 M75 50 L90 60 M75 50 L90 50" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  virgo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 Q30 50 50 80 Q70 50 50 20" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 80 L50 95 M40 85 L50 95 L60 85" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  libra: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 50 L75 50" stroke="currentColor" stroke-width="4" fill="none"/><path d="M25 50 L35 40 L65 40 L75 50" stroke="currentColor" stroke-width="4" fill="none"/><path d="M25 50 L35 60 L65 60 L75 50" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  scorpio: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 30 L50 60 Q50 80 65 80 Q80 80 80 65" stroke="currentColor" stroke-width="4" fill="none"/><path d="M80 65 L85 60 M80 65 L85 70" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  sagittarius: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 70 L50 30 L70 70" stroke="currentColor" stroke-width="4" fill="none"/><line x1="50" y1="30" x2="50" y2="90" stroke="currentColor" stroke-width="4"/><path d="M50 90 L40 80 M50 90 L60 80" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  capricorn: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 40 Q50 30 70 50 Q50 70 30 60 L30 40" stroke="currentColor" stroke-width="4" fill="none"/><path d="M30 60 L20 70" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  aquarius: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 40 L70 40 M30 50 L70 50 M30 60 L70 60" stroke="currentColor" stroke-width="4" fill="none"/><path d="M40 40 L40 60 M60 40 L60 60" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  pisces: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 40 Q50 60 70 40" stroke="currentColor" stroke-width="4" fill="none"/><path d="M30 60 Q50 40 70 60" stroke="currentColor" stroke-width="4" fill="none"/><path d="M30 50 L20 40 M30 50 L20 60" stroke="currentColor" stroke-width="4" fill="none"/><path d="M70 50 L80 40 M70 50 L80 60" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
};

// Planets as SVG paths
const PLANET_SYMBOLS: Record<string, string> = {
  sun: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="20" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 15 L50 25 M50 75 L50 85 M15 50 L25 50 M75 50 L85 50 M25 25 L32 32 M68 68 L75 75 M75 25 L68 32 M32 68 L25 75" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  moon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M60 25 Q30 50 60 75 Q80 50 60 25" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  mercury: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="18" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 58 L50 85 M35 85 L65 85" stroke="currentColor" stroke-width="4" fill="none"/><path d="M35 60 L65 60" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  venus: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="18" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 58 L50 85 L40 95" stroke="currentColor" stroke-width="4" fill="none"/><path d="M35 30 L65 30" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  mars: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="35" r="18" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 53 L50 85 M40 85 L60 85 M50 53 L35 60 M50 53 L65 60" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  jupiter: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 25 Q50 25 50 50 L50 75 M35 25 L35 50" stroke="currentColor" stroke-width="4" fill="none"/><path d="M65 25 L35 50 M65 25 L35 25 M65 25 L65 50" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  saturn: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 25 Q60 50 55 75 Q40 75 35 60 Q30 45 35 25" stroke="currentColor" stroke-width="4" fill="none"/><path d="M20 25 L80 25" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  uranus: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L50 45 M50 55 L50 80" stroke="currentColor" stroke-width="4" fill="none"/><path d="M30 20 Q50 40 70 20 M30 80 Q50 60 70 80" stroke="currentColor" stroke-width="4" fill="none"/><circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  neptune: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 20 Q55 20 65 35 Q75 50 65 65 Q55 80 35 80 Q25 50 35 20" stroke="currentColor" stroke-width="4" fill="none"/><path d="M65 65 L85 85 M75 65 L85 75" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  pluto: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="18" stroke="currentColor" stroke-width="4" fill="none"/><path d="M40 60 Q50 85 60 60" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  chiron: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L50 45" stroke="currentColor" stroke-width="4" fill="none"/><path d="M30 35 Q50 55 70 35" stroke="currentColor" stroke-width="4" fill="none"/><ellipse cx="50" cy="70" rx="15" ry="10" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  northern_node: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 L50 55 Q50 75 50 55" stroke="currentColor" stroke-width="4" fill="none"/><path d="M35 20 L50 10 L65 20" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  southern_node: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 80 L50 45 Q50 25 50 45" stroke="currentColor" stroke-width="4" fill="none"/><path d="M35 80 L50 90 L65 80" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
};

// Aspects as SVG paths
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  sextile: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 70 Q50 50 75 30" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  square: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 25 L70 25 L70 75 L30 75 Z" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  trine: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 80 L50 20 L80 80 Z" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  opposition: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="50" r="15" stroke="currentColor" stroke-width="4" fill="none"/><circle cx="75" cy="50" r="15" stroke="currentColor" stroke-width="4" fill="none"/><path d="M40 50 L60 50" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
  semi_sextile: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 65 Q50 50 65 35" stroke="currentColor" stroke-width="3" fill="none"/></svg>`,
  semi_square: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 25 L70 55" stroke="currentColor" stroke-width="3" fill="none"/><path d="M38 25 L30 33" stroke="currentColor" stroke-width="3" fill="none"/></svg>`,
  quintile: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 50 Q50 30 70 50" stroke="currentColor" stroke-width="3" fill="none"/><path d="M45 20 L50 25 L45 30" stroke="currentColor" stroke-width="3" fill="none"/></svg>`,
  bi_quintile: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 25 Q75 50 50 75 Q25 50 50 25" stroke="currentColor" stroke-width="3" fill="none"/></svg>`,
  sesqui_square: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 25 L70 60" stroke="currentColor" stroke-width="3" fill="none"/><path d="M78 60 L70 55" stroke="currentColor" stroke-width="3" fill="none"/></svg>`,
 quincunx: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M35 25 Q50 50 65 75" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="35" cy="25" r="4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="65" cy="75" r="4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
};

/**
 * Get SVG symbol for astrological types
 * @param type - 'zodiac' | 'planet' | 'aspect'
 * @param name - The specific symbol name (e.g., 'aries', 'sun', 'conjunction')
 * @returns SVG string or placeholder if not found
 */
// fallow-ignore-next-line complexity
function getSymbol(type: 'zodiac' | 'planet' | 'aspect', name: string): string {
  const normalizedName = name.toLowerCase();

  switch (type) {
    case 'zodiac':
      return ZODIAC_SYMBOLS[normalizedName] || getPlaceholder('sign');
    case 'planet':
      return PLANET_SYMBOLS[normalizedName] || getPlaceholder('planet');
    case 'aspect':
      return ASPECT_SYMBOLS[normalizedName] || getPlaceholder('aspect');
    default:
      return getPlaceholder('unknown');
  }
}

/**
 * Generate a placeholder SVG
 */
function getPlaceholder(type: string): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="55" text-anchor="middle" font-size="30">?</text></svg>`;
}

/**
 * Get all available symbol names for a given type
 */
function getSymbolNames(type: 'zodiac' | 'planet' | 'aspect'): string[] {
  switch (type) {
    case 'zodiac':
      return Object.keys(ZODIAC_SYMBOLS);
    case 'planet':
      return Object.keys(PLANET_SYMBOLS);
    case 'aspect':
      return Object.keys(ASPECT_SYMBOLS);
    default:
      return [];
  }
}

/**
 * Check if a symbol exists
 */
function symbolExists(type: 'zodiac' | 'planet' | 'aspect', name: string): boolean {
  const normalizedName = name.toLowerCase();
  switch (type) {
    case 'zodiac':
      return normalizedName in ZODIAC_SYMBOLS;
    case 'planet':
      return normalizedName in PLANET_SYMBOLS;
    case 'aspect':
      return normalizedName in ASPECT_SYMBOLS;
    default:
      return false;
  }
}
