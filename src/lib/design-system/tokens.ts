/**
 * ============================================================================
 * AKASHA PORTAL — Design System Tokens
 * ============================================================================
 * Single source of truth for design values consumed by Tailwind classes,
 * inline styles, and programmatic computations. Mirrors `globals.css` so
 * both static CSS variables and TypeScript consumers stay in sync.
 *
 * Convention:
 *   - All values are FROZEN (read-only at the type level).
 *   - Color tokens use a hierarchical structure (base → semantic → component).
 *   - Keep this file pure data — no React, no DOM, no side effects.
 *
 * Usage:
 *   import { tokens, semanticColor } from '@/lib/design-system/tokens';
 *   const cardBg = semanticColor('surface.elevated');
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  Raw palette (light-mode anchors — dark-mode tokens reference these)       */
/* -------------------------------------------------------------------------- */

export const palette = {
  // Neutrals — slate scale
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  // Brand — Indigo
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // Spiritual — Gold (Divine Light)
  gold: {
    DEFAULT: '#D4AF37',
    light: '#FFD700',
    dark: '#B8860B',
    muted: 'rgba(212, 175, 55, 0.15)',
  },
  // Spiritual — Violet (Higher Consciousness)
  violet: {
    DEFAULT: '#8B5CF6',
    deep: '#6B21A8',
    muted: 'rgba(139, 92, 246, 0.12)',
  },
  // Chakra palette (one per energy center)
  chakra: {
    root: '#EF4444',
    sacral: '#F97316',
    solar: '#EAB308',
    heart: '#22C55E',
    throat: '#38BDF8',
    thirdEye: '#6366F1',
    crown: '#A855F7',
  },
  // Orixá / day-planet associations (Afro-Brazilian spiritual calendar)
  orixa: {
    sun: '#D4A843',
    moon: '#1E3A5F',
    mars: '#C45C26',
    mercury: '#F0B429',
    jupiter: '#2D6A4F',
    venus: '#7C6EB3',
    saturn: '#D4728C',
  },
  // Accent palette
  accent: {
    amber: '#F59E0B',
    emerald: '#10B981',
    rose: '#F43F5E',
    sky: '#0EA5E9',
  },
  // Status
  red: { 500: '#EF4444', 600: '#DC2626' },
  green: { 500: '#22C55E' },
  yellow: { 500: '#EAB308' },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

/* -------------------------------------------------------------------------- */
/*  Spacing scale (matches Tailwind defaults + spiritual extensions)         */
/* -------------------------------------------------------------------------- */

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  // Semantic aliases
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

export const fontFamily = {
  sans: 'var(--font-raleway), system-ui, sans-serif',
  serif: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-mono)',
  heading: 'var(--font-cinzel), serif',
  decorative: 'var(--font-imfell), serif',
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/* -------------------------------------------------------------------------- */
/*  Border radius                                                             */
/* -------------------------------------------------------------------------- */

export const radius = {
  none: '0',
  sm: 'calc(var(--radius) * 0.6)',
  DEFAULT: 'var(--radius)',
  md: 'calc(var(--radius) * 0.8)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) * 1.4)',
  '2xl': 'calc(var(--radius) * 1.8)',
  '3xl': 'calc(var(--radius) * 2.2)',
  '4xl': 'calc(var(--radius) * 2.6)',
  full: '9999px',
} as const;

/* -------------------------------------------------------------------------- */
/*  Shadows                                                                   */
/* -------------------------------------------------------------------------- */

export const shadows = {
  card: 'var(--shadow-card)',
  modal: 'var(--shadow-modal)',
  glowGold: 'var(--shadow-glow-gold)',
  glowViolet: 'var(--shadow-glow-violet)',
  // Standard elevations (Tailwind-aligned)
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

/* -------------------------------------------------------------------------- */
/*  Motion (duration + easing)                                                */
/* -------------------------------------------------------------------------- */

export const duration = {
  instant: '75ms',
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  slower: '600ms',
} as const;

export const easing = {
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/* -------------------------------------------------------------------------- */
/*  Breakpoints (mobile-first)                                                */
/* -------------------------------------------------------------------------- */

export const breakpoints = {
  sm: '640px', // mobile landscape / small tablets
  md: '768px', // tablets
  lg: '1024px', // laptops
  xl: '1280px', // desktops
  '2xl': '1536px', // large screens
} as const;

/* -------------------------------------------------------------------------- */
/*  Z-index scale                                                             */
/* -------------------------------------------------------------------------- */

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
} as const;

/* -------------------------------------------------------------------------- */
/*  Semantic tokens (consumed via CSS vars in globals.css)                    */
/* -------------------------------------------------------------------------- */

export const semanticColor = {
  // Surfaces
  surface: {
    base: 'var(--background)',
    raised: 'var(--card)',
    overlay: 'var(--popover)',
    sunken: 'var(--muted)',
  },
  // Foreground (text)
  text: {
    primary: 'var(--foreground)',
    secondary: 'var(--muted-foreground)',
    accent: 'var(--primary)',
    inverse: 'var(--primary-foreground)',
    danger: 'var(--destructive)',
  },
  // Borders
  border: {
    DEFAULT: 'var(--border)',
    strong: 'var(--ring)',
    input: 'var(--input)',
  },
  // Brand intent
  brand: {
    primary: 'var(--primary)',
    primaryFg: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryFg: 'var(--secondary-foreground)',
  },
  // Spiritual intent (gold / violet)
  spiritual: {
    gold: 'var(--spiritual-gold)',
    goldLight: 'var(--spiritual-gold-light)',
    goldDark: 'var(--spiritual-gold-dark)',
    goldMuted: 'var(--spiritual-gold-muted)',
    violet: 'var(--spiritual-violet)',
    violetDeep: 'var(--spiritual-violet-deep)',
    violetMuted: 'var(--spiritual-violet-muted)',
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Component-level design tokens (consumed by Button, Card, etc.)            */
/* -------------------------------------------------------------------------- */

export const components = {
  button: {
    height: {
      xs: '1.5rem',
      sm: '1.75rem',
      md: '2rem',
      lg: '2.25rem',
      icon: '2rem',
    },
    paddingX: {
      xs: '0.5rem',
      sm: '0.625rem',
      md: '0.625rem',
      lg: '0.625rem',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.8rem',
      md: '0.875rem',
      lg: '0.875rem',
    },
  },
  card: {
    padding: {
      sm: '0.75rem',
      md: '1rem',
      lg: '1.25rem',
    },
    borderRadius: radius.lg,
  },
  input: {
    height: {
      sm: '1.75rem',
      md: '2rem',
      lg: '2.25rem',
    },
    paddingX: '0.625rem',
  },
  badge: {
    height: '1.25rem',
    paddingX: '0.5rem',
    fontSize: '0.75rem',
    borderRadius: radius.full,
  },
  divider: {
    height: '1px',
    thickness: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
  },
  loading: {
    spinnerSize: {
      sm: '1rem',
      md: '2rem',
      lg: '3rem',
    },
    overlayOpacity: 0.75,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Aggregated tokens (single import for consumers)                           */
/* -------------------------------------------------------------------------- */

export const tokens = {
  palette,
  spacing,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  shadows,
  duration,
  easing,
  breakpoints,
  zIndex,
  components,
} as const;

export type Tokens = typeof tokens;
export type Palette = typeof palette;
export type SemanticColor = typeof semanticColor;
